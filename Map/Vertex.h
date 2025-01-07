#pragma once


#include<glm/glm.hpp>
#include<glad/glad.h>
#include<vector>

struct Vertex {
	glm::vec3 position;
	glm::vec3 normal;
	glm::vec3 color;
	glm::vec2 texUV;
};

class VBO {
public:
	GLuint ID;
	VBO(GLfloat* vertices, GLsizeiptr size);
	VBO(std::vector<Vertex>& vertices);
	void Bind();
	void Unbind();
	void Delete();
};

class VAO {
public:
	GLuint ID;
	VAO();
	void LinkVBO(VBO VBO, GLuint layout);
	void LinkAttrib(VBO& VBO, GLuint layout, GLuint numComponents, GLenum type, GLsizeiptr stride, void* offset);
	void Bind();
	void Unbind();
	void Delete();
};

class EBO {
public:
	GLuint ID;
	EBO(GLuint* indices, GLsizeiptr size);
	EBO(std::vector<GLuint>& indices);
	void Bind();
	void Unbind();
	void Delete();
};
