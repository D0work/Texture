#version 330 core

out vec4 FragColor;

in vec3 crntPos;
in vec3 Normal;
in vec3 color;
in vec2 texCoord;
in vec3 lightPos;
in vec3 camPos;

uniform sampler2D diffuse0;
uniform sampler2D specular0;
uniform sampler2D normal0;
uniform sampler2D displacement0;
uniform vec4 lightColor;

vec4 pointLight(){	
	vec3 lightVec = lightPos - crntPos;

	float dist = length(lightVec);
	float a = 1.00f;
	float b = 0.70f;
	float I = 1.0f / (a * dist * dist + b * dist + 1.0f);

	// ambient 
	float ambient = 0.05f;

	vec3 viewDirection = normalize(camPos - crntPos);
	
	float heightScale = 0.05f;
	const float minLayers = 8.0f;
    const float maxLayers = 64.0f;
    float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0f, 0.0f, 1.0f), viewDirection)));
	float layerDepth = 1.0f / numLayers;
	float currentLayerDepth = 0.0f;
	
	//delta
	vec2 S = viewDirection.xy / viewDirection.z * heightScale; 
    vec2 deltaUVs = S / numLayers;	
	vec2 UVs = texCoord;
	float currentDepthMapValue = 1.0f - texture(displacement0, UVs).r;
	
	// while hit
	while(currentLayerDepth < currentDepthMapValue){
        UVs -= deltaUVs;
        currentDepthMapValue = 1.0f - texture(displacement0, UVs).r;
        currentLayerDepth += layerDepth;
    }

	// interpolation
	vec2 prevTexCoords = UVs + deltaUVs;
	float afterDepth  = currentDepthMapValue - currentLayerDepth;
	float beforeDepth = 1.0f - texture(displacement0, prevTexCoords).r - currentLayerDepth + layerDepth;
	float weight = afterDepth / (afterDepth - beforeDepth);
	UVs = prevTexCoords * weight + UVs * (1.0f - weight);

	// outside 
	if(UVs.x > 1.0 || UVs.y > 1.0 || UVs.x < 0.0 || UVs.y < 0.0) discard;

	// diffuse 
	// Normals are mapped from the range [0, 1] to the range [-1, 1]
	vec3 normal = normalize(texture(normal0, UVs).xyz * 2.0f - 1.0f);
	vec3 lightDirection = normalize(lightVec);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular
	float specular = 0.0f;
	if (diffuse != 0.0f){
		float specularLight = 0.50f;
		vec3 halfwayVec = normalize(viewDirection + lightDirection);
		float specAmount = pow(max(dot(normal, halfwayVec), 0.0f), 16);
		specular = specAmount * specularLight;
	};

	return (texture(diffuse0, UVs) * (diffuse * I + ambient) + texture(specular0, UVs).r * specular * I) * lightColor;
}

vec4 direcLight(){
	// ambient 
	float ambient = 0.20f;

	// diffuse 
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(vec3(1.0f, 1.0f, 0.0f));
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular 
	float specular = 0.0f;
	if (diffuse != 0.0f){
		float specularLight = 0.50f;
		vec3 viewDirection = normalize(camPos - crntPos);
		vec3 halfwayVec = normalize(viewDirection + lightDirection);
		float specAmount = pow(max(dot(normal, halfwayVec), 0.0f), 16);
		specular = specAmount * specularLight;
	};

	return (texture(diffuse0, texCoord) * (diffuse + ambient) + texture(specular0, texCoord).r * specular) * lightColor;
}

vec4 spotLight(){
    //angle incidance
	float outerCone = 0.90f;
	float innerCone = 0.95f;

	// ambient 
	float ambient = 0.20f;

	// diffuse 
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightPos - crntPos);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular 
	float specular = 0.0f;
	if (diffuse != 0.0f){
		float specularLight = 0.50f;
		vec3 viewDirection = normalize(camPos - crntPos);
		vec3 halfwayVec = normalize(viewDirection + lightDirection);
		float specAmount = pow(max(dot(normal, halfwayVec), 0.0f), 16);
		specular = specAmount * specularLight;
	};

	float angle = dot(vec3(0.0f, -1.0f, 0.0f), -lightDirection);
	float I = clamp((angle - outerCone) / (innerCone - outerCone), 0.0f, 1.0f);

	return (texture(diffuse0, texCoord) * (diffuse * I + ambient) + texture(specular0, texCoord).r * specular * I) * lightColor;
}

void main(){
	FragColor = pointLight();
}