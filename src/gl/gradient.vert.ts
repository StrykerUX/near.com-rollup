/**
 * Fullscreen-triangle vertex shader for the gradient field.
 *
 * Ported verbatim from the original single-file build. Kept as a template
 * string rather than a .glsl import so the shader needs no bundler loader and
 * travels with the module that compiles it.
 */
export const VERT = /* glsl */ `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;
