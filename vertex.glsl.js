export default /* glsl */ `#version 300 es

in vec2 position;

void main() {
  gl_Position = vec4(position.xy, 0, 1);
}
`;