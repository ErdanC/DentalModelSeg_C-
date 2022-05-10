  attribute vec4 uv3;
        varying vec4 v_TexCoord;
        varying vec4 v_pos;
        void main() {
        gl_Position = projectionMatrix *modelViewMatrix*vec4(position,1.0);
        v_TexCoord=uv3;
        v_pos=gl_Position;

        }