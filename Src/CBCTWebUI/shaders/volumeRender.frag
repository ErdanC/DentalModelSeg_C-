  varying vec4  v_TexCoord;
        uniform sampler2D u_FrontTexCoordMap;
        uniform sampler2D u_BackTexCoordMap;


        uniform sampler2D u_TextureMap;
    

        uniform sampler2D u_EnvironmentDepth;
        uniform sampler2D uTransferFunction;
		uniform sampler2D u_VolumeDataFlag;
		uniform float u_numberOfSlices;
		uniform int u_withEnvDepth;
		uniform int u_RenderAsImage;
		uniform float u_SlicesOverX;
		uniform float u_SlicesOverY;
        varying vec4 v_Pos;

        const float steps =150.0;

		/*
        const float zNear=1.0;
        const float zFar=1000.0;
        float linearDepth(float depthSample)
        {
        return depthSample;
        depthSample = 2.0 * depthSample - 1.0;
        float zLinear = 2.0 * zNear * zFar / (zFar + zNear - depthSample * (zFar - zNear));

        return zLinear;
        }
		*/
      
        vec4 texture3D(sampler2D tex,vec3 volpos)
        {


      
      
        float s1,s2;
        float dx1,dy1;
        float dx2,dy2;

        vec2 texpos1,texpos2;

        s1 = floor(volpos.z*u_numberOfSlices);
        s2 = s1+1.0;

        dx1 = fract(s1/u_SlicesOverX);
        dy1 = floor(s1/u_SlicesOverX)/u_SlicesOverY;

        dx2 = fract(s2/u_SlicesOverX);
        dy2 = floor(s2/u_SlicesOverX)/u_SlicesOverY;

        texpos1.x = dx1+(volpos.x/u_SlicesOverX);
        texpos1.y = dy1+(volpos.y/u_SlicesOverY);

        texpos2.x = dx2+(volpos.x/u_SlicesOverX);
        texpos2.y = dy2+(volpos.y/u_SlicesOverY);

        vec4 p1=texture2D(tex,texpos1);
        vec4 p2=texture2D(tex,texpos2);

        //return mix( (p1.r+p1.g+p1.b)/3.0, (p2.r+p2.g+p2.b)/3.0, (volpos.z*u_numberOfSlices)-s1);
		//return mix( p1.r, p2.r, (volpos.z*u_numberOfSlices)-s1);
		return mix( p1, p2, (volpos.z*u_numberOfSlices)-s1);
        }

        void main() {


        vec2 screenTexCoord = v_Pos.xy/v_Pos.w;
        screenTexCoord.x = 0.5*screenTexCoord.x + 0.5;
        screenTexCoord.y = 0.5*screenTexCoord.y + 0.5;



        vec4 frontTexCoord = texture2D(u_FrontTexCoordMap,screenTexCoord);
		 vec4 backTexCoord = texture2D(u_BackTexCoordMap,screenTexCoord);
		float minimal=0.001;
		//if(!((frontTexCoord.r>-minimal&&frontTexCoord.r<minimal)||(frontTexCoord.r>1.0-minimal&&frontTexCoord.r<1.0+minimal)||(frontTexCoord.g>-minimal&&frontTexCoord.g<minimal)||(frontTexCoord.g>1.0-minimal&&frontTexCoord.g<1.0+minimal)||(frontTexCoord.b>-minimal&&frontTexCoord.b<minimal)||(frontTexCoord.b>1.0-minimal&&frontTexCoord.b<1.0+minimal)))//pixel inside cube
		if(u_RenderAsImage==1)
		{
		
		float vdflag=texture3D(u_VolumeDataFlag,frontTexCoord.xyz).r;
		if(vdflag==0.0)
		gl_FragColor=texture3D(u_TextureMap,frontTexCoord.xyz);
		else
		{
		gl_FragColor=vec4(1.0,0.0,0.0,1.0);
		}
		
		}
		else
		{
		
       



        vec4 currentPos = frontTexCoord;

        float frontDepth=frontTexCoord.a;
        float backDepth=backTexCoord.a;
		float envDepth=999999999.0;
		if(u_withEnvDepth==1&&texture2D(u_EnvironmentDepth,screenTexCoord).r>0.0)
		  envDepth=texture2D(u_EnvironmentDepth,screenTexCoord).r;
        

        float depthStep=(backDepth-frontDepth)/steps;

        float currentDepth=frontDepth;
     

        vec3 dir = backTexCoord.xyz - currentPos.xyz;
        vec3 Step = dir/steps;
 

        vec4 accum = vec4(0, 0, 0, 0);
		float accAlpha = 0.0;



		


        for(float i = 0.0; i<=steps; i+=1.0)
        {

   
    
   
	  
       float value=texture3D(u_TextureMap,currentPos.xyz).r;
	   vec4 srcValue=vec4(value);
	   srcValue.a= texture2D(uTransferFunction,vec2(value,0.1)).r;
	    float vdflag=texture3D(u_VolumeDataFlag,frontTexCoord.xyz).r;
		if(vdflag!=0.0){
			//srcValue=vec4(1.0,0.0,0.0,1.0);
	accum=vec4(1.0,0.0,0.0,1.0);
	break ;
		}

	   srcValue.rgb *= srcValue.a;
       //accAlpha += (1.0 - pow((1.0 - srcValue.a), depthStep));
	    accAlpha += (1.0 - pow((1.0 - srcValue.a), depthStep));
        accum += ((1.0 - accum.a) * srcValue);


    

        currentPos.xyz += Step;

        currentDepth+=depthStep;

        if(currentPos.x< 0.0 || currentPos.y < 0.0 || currentPos.z<0.0||currentPos.x> 1.0 || currentPos.y >1.0 || currentPos.z>1.0 ||accAlpha>=1.0||currentDepth>=envDepth)
            break;


            }
          
            gl_FragColor=accum;
			
	//gl_FragColor=vec4(texture2D(uTransferFunction,screenTexCoord).r);
	//gl_FragColor.a=1.0;
	}
  }