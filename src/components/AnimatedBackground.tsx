import { useEffect, useRef, useState } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  
  // Colors - matching reference image
  const vec3 coreColor = vec3(0.52, 0.42, 0.98);       // Bright violet center
  const vec3 midColor = vec3(0.45, 0.32, 0.85);        // Mid violet
  const vec3 outerColor = vec3(0.25, 0.15, 0.55);      // Outer violet
  const vec3 deepColor = vec3(0.08, 0.04, 0.18);       // Deep purple edge
  const vec3 blackColor = vec3(0.0, 0.0, 0.0);
  
  // Improved noise functions
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    
    // Aspect ratio correction
    float aspect = u_resolution.x / u_resolution.y;
    pos.x *= aspect;
    
    float r = length(pos);
    float theta = atan(pos.y, pos.x);
    
    // Breathing animation - subtle
    float breathe = 1.0 + 0.02 * sin(u_time * 1.047);
    
    // Rotation animation for rays
    float rotationOffset = u_time * 0.15;
    
    // Core glow - larger and brighter center
    float coreRadius = 0.28 * breathe;
    float glow = 1.0 - smoothstep(0.0, coreRadius + 0.35, r);
    glow = pow(glow, 0.6);
    
    // More prominent rays with irregular lengths - 24-36 rays
    float rayCount = 28.0;
    float rays = 0.0;
    
    // Multiple ray layers for irregularity
    float ray1 = pow(abs(sin(rayCount * (theta + rotationOffset))), 3.0);
    float ray2 = pow(abs(sin((rayCount * 0.5) * (theta + rotationOffset * 0.7 + 0.5))), 4.0) * 0.6;
    float ray3 = pow(abs(sin((rayCount * 1.5) * (theta + rotationOffset * 1.3))), 5.0) * 0.4;
    
    // Apply fBM noise for irregularity
    float rayNoise = fbm(vec2(theta * 4.0 + u_time * 0.05, r * 3.0));
    rays = (ray1 + ray2 + ray3) * rayNoise;
    
    // Rays should extend outward from the glow edge
    float rayMask = smoothstep(0.1, 0.22, r) * smoothstep(0.7, 0.25, r);
    rays *= rayMask * 0.8;
    
    // Bias rays to be brighter/longer on right and lower sections
    float rayBias = 1.0 + 0.3 * sin(theta - 0.5) + 0.2 * cos(theta * 2.0);
    rays *= rayBias;
    
    // Combine glow and rays
    float combined = glow + rays * 0.5;
    
    // Posterization/banding effect - 14-18 levels
    float bands = 16.0;
    float bandedValue = floor(combined * bands + 0.5) / bands;
    combined = mix(combined, bandedValue, 0.7);
    
    // Micro flicker
    float flicker = 1.0 + 0.015 * sin(u_time * 3.1) * sin(u_time * 4.7);
    combined *= flicker;
    
    // Color gradient from center outward
    vec3 color = coreColor;
    color = mix(coreColor, midColor, smoothstep(0.0, 0.15, r));
    color = mix(color, outerColor, smoothstep(0.15, 0.35, r));
    color = mix(color, deepColor, smoothstep(0.3, 0.55, r));
    
    // Apply brightness from combined glow/rays
    color *= combined * 1.4;
    
    // Strong vignette to black corners
    float vignette = 1.0 - smoothstep(0.3, 0.85, r);
    vignette = pow(vignette, 0.8);
    color = mix(blackColor, color, vignette);
    
    // Subtle grain
    float grain = hash(uv * u_resolution + u_time * 100.0);
    color += (grain - 0.5) * 0.06;
    
    // Very subtle scanlines
    float scanline = sin(gl_FragCoord.y * 1.5) * 0.015;
    color -= scanline;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const animationRef = useRef<number>();
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let startTime = Date.now();
    const render = () => {
      const time = prefersReducedMotion ? 0 : (Date.now() - startTime) / 1000;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [prefersReducedMotion]);

  if (!webglSupported) {
    return <CSSFallbackBackground reducedMotion={prefersReducedMotion} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
    />
  );
};

const CSSFallbackBackground = ({ reducedMotion }: { reducedMotion: boolean }) => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-black">
      {/* Glow layer */}
      <div 
        className={`absolute inset-0 ${reducedMotion ? '' : 'animate-glow-breathe'}`}
        style={{
          background: `
            radial-gradient(ellipse 45% 45% at 50% 50%, 
              rgba(133, 107, 250, 1) 0%,
              rgba(115, 82, 217, 1) 15%,
              rgba(90, 60, 180, 1) 25%,
              rgba(65, 38, 140, 1) 35%,
              rgba(45, 25, 100, 1) 45%,
              rgba(25, 12, 60, 1) 55%,
              rgba(10, 5, 30, 1) 70%,
              rgba(0, 0, 0, 1) 100%
            )
          `,
          filter: 'contrast(1.2)'
        }}
      />
      
      {/* Rays layer */}
      <div 
        className={`absolute inset-0 ${reducedMotion ? '' : 'animate-rays-rotate'}`}
        style={{
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(140, 120, 255, 0.4) 3deg,
              transparent 8deg,
              transparent 12deg,
              rgba(140, 120, 255, 0.35) 15deg,
              transparent 20deg,
              transparent 28deg,
              rgba(140, 120, 255, 0.45) 32deg,
              transparent 38deg,
              transparent 48deg,
              rgba(140, 120, 255, 0.3) 52deg,
              transparent 58deg,
              transparent 68deg,
              rgba(140, 120, 255, 0.4) 72deg,
              transparent 78deg,
              transparent 88deg,
              rgba(140, 120, 255, 0.35) 92deg,
              transparent 98deg,
              transparent 110deg,
              rgba(140, 120, 255, 0.5) 114deg,
              transparent 120deg,
              transparent 132deg,
              rgba(140, 120, 255, 0.3) 136deg,
              transparent 142deg,
              transparent 155deg,
              rgba(140, 120, 255, 0.4) 160deg,
              transparent 166deg,
              transparent 178deg,
              rgba(140, 120, 255, 0.35) 182deg,
              transparent 188deg,
              transparent 200deg,
              rgba(140, 120, 255, 0.45) 205deg,
              transparent 212deg,
              transparent 225deg,
              rgba(140, 120, 255, 0.3) 230deg,
              transparent 238deg,
              transparent 252deg,
              rgba(140, 120, 255, 0.4) 258deg,
              transparent 265deg,
              transparent 278deg,
              rgba(140, 120, 255, 0.35) 284deg,
              transparent 292deg,
              transparent 308deg,
              rgba(140, 120, 255, 0.45) 315deg,
              transparent 322deg,
              transparent 338deg,
              rgba(140, 120, 255, 0.3) 345deg,
              transparent 352deg,
              transparent 360deg
            )
          `,
          filter: 'blur(6px)',
          mask: 'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 15%, white 35%, transparent 75%)'
        }}
      />
      
      {/* Grain overlay */}
      <div 
        className={`absolute inset-0 opacity-[0.06] ${reducedMotion ? '' : 'animate-grain'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />
      
      {/* Strong vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.85) 75%, #000000 100%)'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;