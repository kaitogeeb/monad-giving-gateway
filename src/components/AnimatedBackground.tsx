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
  const vec3 coreColor = vec3(0.52, 0.42, 0.98);
  const vec3 midColor = vec3(0.45, 0.32, 0.85);
  const vec3 outerColor = vec3(0.25, 0.15, 0.55);
  const vec3 deepColor = vec3(0.08, 0.04, 0.18);
  const vec3 blackColor = vec3(0.0, 0.0, 0.0);
  
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
  
  // Single explosion wave - doubled size
  float explosionWave(vec2 pos, float r, float phase, float rotOffset) {
    float waveRadius = mod(phase, 1.0) * 2.0; // Doubled expansion
    float waveIntensity = 1.0 - mod(phase, 1.0);
    waveIntensity = pow(waveIntensity, 0.5);
    
    float thickness = 0.3 + 0.2 * waveRadius; // Doubled thickness
    float wave = smoothstep(waveRadius - thickness, waveRadius, r) * 
                 smoothstep(waveRadius + thickness * 0.5, waveRadius, r);
    
    float theta = atan(pos.y, pos.x);
    float rayCount = 28.0;
    float ray1 = pow(abs(sin(rayCount * (theta + rotOffset))), 3.0);
    float ray2 = pow(abs(sin((rayCount * 0.5) * (theta + rotOffset * 0.7 + 0.5))), 4.0) * 0.6;
    float rayNoise = fbm(vec2(theta * 4.0 + phase * 2.0, r * 3.0));
    float rays = (ray1 + ray2) * rayNoise * wave;
    
    float glow = exp(-r * 2.0 / (0.6 + waveRadius * 1.4)) * waveIntensity; // Doubled glow size
    
    return (wave * 0.6 + rays * 0.4 + glow * 0.5) * waveIntensity;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    
    float aspect = u_resolution.x / u_resolution.y;
    pos.x *= aspect;
    
    float r = length(pos);
    float theta = atan(pos.y, pos.x);
    
    // Multiple explosion waves with different phases
    float cycleDuration = 3.0;
    float phase1 = mod(u_time / cycleDuration, 1.0);
    float phase2 = mod(u_time / cycleDuration + 0.33, 1.0);
    float phase3 = mod(u_time / cycleDuration + 0.66, 1.0);
    
    float rotSpeed = 0.15;
    float rot1 = u_time * rotSpeed;
    float rot2 = u_time * rotSpeed * 0.8 + 1.0;
    float rot3 = u_time * rotSpeed * 1.2 + 2.0;
    
    float wave1 = explosionWave(pos, r, phase1, rot1);
    float wave2 = explosionWave(pos, r, phase2, rot2);
    float wave3 = explosionWave(pos, r, phase3, rot3);
    
    float combined = wave1 + wave2 + wave3;
    
    // Central glow that pulses - bigger
    float centralPhase = mod(u_time / cycleDuration, 1.0);
    float centralGlow = exp(-r * 4.0) * (1.0 - centralPhase) * 2.5;
    combined += centralGlow;
    
    // Banding
    float bands = 16.0;
    float bandedValue = floor(combined * bands + 0.5) / bands;
    combined = mix(combined, bandedValue, 0.6);
    
    // Flicker
    float flicker = 1.0 + 0.02 * sin(u_time * 3.1) * sin(u_time * 4.7);
    combined *= flicker;
    
    // Color gradient
    vec3 color = coreColor;
    color = mix(coreColor, midColor, smoothstep(0.0, 0.2, r));
    color = mix(color, outerColor, smoothstep(0.2, 0.4, r));
    color = mix(color, deepColor, smoothstep(0.35, 0.6, r));
    
    color *= combined * 1.2;
    
    // Vignette - adjusted for bigger explosion
    float vignette = 1.0 - smoothstep(0.5, 1.2, r);
    vignette = pow(vignette, 0.6);
    color = mix(blackColor, color, vignette);
    
    // Grain
    float grain = hash(uv * u_resolution + u_time * 100.0);
    color += (grain - 0.5) * 0.05;
    
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

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

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
      <div 
        className={`absolute inset-0 ${reducedMotion ? '' : 'animate-explosion'}`}
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