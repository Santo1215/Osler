# **Osler – Sistema Integral de Gestión de Citas Médicas y Expedientes Clínicos**

<p align="center">
  <img src="Logo_Osler.png" width="250">
</p>


Osler es un sistema web diseñado para optimizar la gestión de citas médicas, expedientes clínicos, pagos en línea y administración hospitalaria. Su objetivo principal es mejorar la experiencia de pacientes, médicos y personal administrativo mediante un software eficiente, seguro y moderno.


---

##  **Tabla de Contenidos**

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Objetivos](#objetivos)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Arquitectura General](#arquitectura-general)
5. [Equipo de Desarrollo](#equipo-de-desarrollo)
6. [Trabajo Colaborativo (JIRA)](#trabajo-colaborativo-jira)
7. [Repositorio](#repositorio)
8. [Cómo ejecutar el proyecto Osler en local](#Cómo-ejecutar-el-proyecto-Osler-en-local)
---

## 📖 **Descripción del Proyecto**

Osler es un software integral orientado a centros de salud, que permite:

* Agendamiento en línea de citas médicas.
* Modificación y cancelación de citas.
* Administración de historiales clínicos digitalizados.
* Gestión de pagos electrónicos.
* Visualización en tiempo real de información médica para pacientes.
* Generación de reportes estadísticos administrativos.
* Integración con servicios externos como pasarelas de pago.
* Implementación de IA para apoyar procesos clínicos y administrativos.

El sistema fue diseñado bajo **metodologías ágiles**, priorizando escalabilidad, seguridad, accesibilidad y usabilidad.


---
## 🎯 **Objetivos**

### **Objetivo General**

Desarrollar un software ágil y seguro que optimice la gestión médica y administrativa en centros de salud mediante tecnologías modernas, IA y buenas prácticas de ingeniería de software.


### **Objetivos Específicos**

1. Permitir reserva, reprogramación y cancelación de citas médicas.
2. Centralizar historiales clínicos digitalizados.
3. Implementar pagos electrónicos seguros.
4. Diseñar una interfaz moderna, responsiva e intuitiva.
5. Integrar IA para apoyar decisiones clínicas y administrativas.
6. Generar reportes sobre citas, atención y gestión hospitalaria.
7. Cumplir normativas de seguridad y confidencialidad de datos.


---

## **Tecnologías Utilizadas**

| Componente                   | Tecnología                        |
| ---------------------------- | --------------------------------- |
| **Frontend**                 | HTML5, CSS3, JavaScript, React.js |
| **Backend**                  | Node.js                           |
| **Base de Datos Relacional** | PostgreSQL                        |
| **Autenticación**            | OAuth 2.0                         |
| **Prototipos UI/UX**         | Figma                             |
| **Gestión de Proyecto**      | Jira Software                     |
| **Control de Versiones**     | GitHub                            |


---

## **Arquitectura General**

El sistema está construido bajo una arquitectura **cliente-servidor**, con:

* Frontend React para interacción con usuarios.
* Backend Node.js basado en API REST.
* Base de datos PostgreSQL para almacenamiento seguro.
* Integraciones externas como pasarelas de pago usando APIs RESTful.
* Módulos independientes para citas, usuarios, historial, pagos y reportes.


---

## 👥 **Equipo de Desarrollo**

| Nombre                                 | Rol              |
| -------------------------------------- | ---------------- |
| **Jesus David Santodomingo Carrascal** | Scrum Master     |
| **Mateo Andres Delgado Fonseca**       | Development Team |
| **José David Meneses Amaya**           | Development Team |

---

## 📅 **Trabajo Colaborativo (JIRA)**

Todo el trabajo ágil y la gestión del product backlog se realizó en JIRA:

🔗 [https://correo-team-mtdelgado.atlassian.net/jira/software/projects/SCRUM/boards/1](https://correo-team-mtdelgado.atlassian.net/jira/software/projects/SCRUM/boards/1)

---

## 📦 **Repositorio del Proyecto**

🔗 **[https://github.com/Santo1215/Osler.git](https://github.com/Santo1215/Osler.git)**


---



## Cómo ejecutar el proyecto Osler en local

Este proyecto está dividido en dos partes: **frontend (React)** y **backend (Node.js + Express)**. Asegurese de tener instalado [Node.js](https://nodejs.org/) antes de comenzar.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/osler.git
cd osler
```
2. Abrir el proyecto

Abrir la carpeta clonada directamente en Visual Studio Code o en cualquier editor depreferencia. 

### 2. Instalar dependencias

En VS Code abrir una nueva terminal y correr los siguiente comandos que permiten acceder a la carpeta cliente y realizar la instalación de npm

#### Frontend

```bash
cd client
npm install
```

Repetir el proceso para la carpeta server

#### Backend

```bash
cd ../server
npm install
```


### 4. Ejecutar el frontend

Una vez realizada la instalación de npm en la terminal se ejecutará los siguientes comandos en los que accedemos a la carpeta cliente y iniciamos npm. Esto abrirá la interfaz gráfica de Osler.


```bash
cd ../client
npm start
```

Esto abrirá la aplicación React en http://localhost:3000

### 5. Ejecutar el backend

A continuació se realiza de manera similar en la terminal pero accediendo a la carpeta server para levantar el servidor en http://localhost:3001.

```bash
cd server
node server.js
```


Una vez realizados estos pasos el sistema levanta un servidor de desarrollo y automáticamente abre el navegador.
