export default /* glsl */ `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 uColor;

void main() {
    // outColor = vec4(vColor.rgb,vColor.a);
    // outColor = vec4(vColor.rgb,uColor.a);
    outColor = uColor;
}
`;