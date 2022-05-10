 varying vec4 v_TexCoord;
        varying vec4 v_pos;
        void main()
        {

        gl_FragColor=v_TexCoord;
        gl_FragColor.a=gl_FragCoord.z/gl_FragCoord.w;

        }