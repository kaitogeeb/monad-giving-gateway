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
  
  // Colors
  const vec3 coreColor = vec3(0.482, 0.361, 1.0);      // #7B5CFF
  const vec3 tintColor = vec3(0.643, 0.545, 1.0);      // #A48BFF
  const vec3 deepColor = vec3(0.039, 0.027, 0.125);    // #0A0720
  const vec3 blackColor = vec3(0.0, 0.0, 0.0);
  
  // Noise functions
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
    vec2 center = vec2(0.5, 0.45); // Glow slightly above center
    vec2 pos = uv - center;
    
    // Aspect ratio correction
    float aspect = u_resolution.x / u_resolution.y;
    pos.x *= aspect;
    
    float r = length(pos);
    float theta = atan(pos.y, pos.x);
    
    // Breathing animation
    float breathe = 1.0 + 0.03 * sin(u_time * 1.047); // 6s cycle
    
    // Rotation animation
    float rotationOffset = u_time * 0.209; // ~30s full rotation
    
    // Core glow with breathing
    float coreRadius = 0.35 * breathe;
    float glow = smoothstep(coreRadius + 0.25, coreRadius * 0.3, r);
    glow = pow(glow, 0.8);
    
    // Rays with fBM noise for irregularity
    float rayCount = 18.0;
    float rays = abs(sin(rayCount * (theta + rotationOffset)));
    float rayNoise = fbm(vec2(theta * 3.0, r * 2.0 + u_time * 0.1));
    rays *= rayNoise;
    rays *= smoothstep(0.5, 0.15, r); // Rays only near glow edge
    rays *= smoothstep(0.1, 0.25, r); // No rays at center
    
    // Combine glow and rays
    float combined = glow + rays * 0.6;
    
    // Posterization/banding effect
    float bands = 16.0;
    combined = floor(combined * bands) / bands;
    
    // Micro flicker
    float flicker = 1.0 + 0.02 * sin(u_time * 2.5) * sin(u_time * 3.7);
    combined *= flicker;
    
    // Color mixing
    vec3 color = mix(deepColor, coreColor, combined);
    color = mix(color, tintColor, combined * combined * 0.5);
    
    // Vignette
    float vignette = smoothstep(0.9, 0.3, r);
    color = mix(blackColor, color, vignette);
    
    // Grain
    float grain = hash(uv * u_resolution + u_time * 100.0);
    color += (grain - 0.5) * 0.1;
    
    // Scanlines
    float scanline = sin(gl_FragCoord.y * 2.0) * 0.02;
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
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

const CSSFallbackBackground = ({ reducedMotion }: { reducedMotion: boolean }) => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#0A0720]">
      {/* Glow layer */}
      <div 
        className={`absolute inset-0 ${reducedMotion ? '' : 'animate-glow-breathe'}`}
        style={{
          background: `
            radial-gradient(ellipse 50% 50% at 50% 45%, 
              #A48BFF 0%,
              #7B5CFF 20%,
              #5B3CDF 35%,
              #3B1CBF 45%,
              #2B0C9F 52%,
              #1B0080 58%,
              #150060 64%,
              #100040 70%,
              #0A0720 80%,
              #000000 100%
            )
          `,
          filter: 'contrast(1.3)'
        }}
      />
      
      {/* Rays layer */}
      <div 
        className={`absolute inset-0 ${reducedMotion ? '' : 'animate-rays-rotate'}`}
        style={{
          background: `
            conic-gradient(
              from 0deg at 50% 45%,
              transparent 0deg,
              rgba(164, 139, 255, 0.3) 5deg,
              transparent 10deg,
              transparent 20deg,
              rgba(164, 139, 255, 0.25) 25deg,
              transparent 30deg,
              transparent 45deg,
              rgba(164, 139, 255, 0.35) 50deg,
              transparent 55deg,
              transparent 70deg,
              rgba(164, 139, 255, 0.2) 75deg,
              transparent 80deg,
              transparent 95deg,
              rgba(164, 139, 255, 0.3) 100deg,
              transparent 105deg,
              transparent 120deg,
              rgba(164, 139, 255, 0.25) 125deg,
              transparent 130deg,
              transparent 145deg,
              rgba(164, 139, 255, 0.4) 150deg,
              transparent 155deg,
              transparent 175deg,
              rgba(164, 139, 255, 0.2) 180deg,
              transparent 185deg,
              transparent 200deg,
              rgba(164, 139, 255, 0.3) 205deg,
              transparent 210deg,
              transparent 225deg,
              rgba(164, 139, 255, 0.25) 230deg,
              transparent 235deg,
              transparent 255deg,
              rgba(164, 139, 255, 0.35) 260deg,
              transparent 265deg,
              transparent 280deg,
              rgba(164, 139, 255, 0.2) 285deg,
              transparent 290deg,
              transparent 310deg,
              rgba(164, 139, 255, 0.3) 315deg,
              transparent 320deg,
              transparent 340deg,
              rgba(164, 139, 255, 0.25) 345deg,
              transparent 350deg,
              transparent 360deg
            )
          `,
          filter: 'blur(8px)',
          mask: 'radial-gradient(ellipse 60% 60% at 50% 45%, transparent 20%, white 40%, transparent 80%)'
        }}
      />
      
      {/* Grain overlay */}
      <div 
        className={`absolute inset-0 opacity-[0.08] ${reducedMotion ? '' : 'animate-grain'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 80%, #000000 100%)'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
