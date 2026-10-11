<div align="center">
      <img src="https://files.catbox.moe/q6q3ul.jpeg" alt="Anzz Banner" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);">
</div>

<h1 align="center">🍃 Anzz - Infinity Wa - Bot 🍁</h1>

<div align="center">
  <a href="https://github.com/Anzzdskk/INFINITY">
    <img src="https://img.shields.io/badge/Versi%C3%B3n-3.0.0-FF0000?style=for-the-badge&logo=github&logoColor=white" alt="Version"
    
---

### 📌 Información Importante

<details>
  <summary><b> 📑 Nota de Deslinde y Uso</b></summary>
  <br>
  Este proyecto es un desarrollo independiente con fines de entretenimiento y automatización. No está afiliado, asociado, autorizado ni respaldado oficialmente por WhatsApp Inc. o cualquiera de sus filiales. Utilice el bot de manera responsable para evitar suspensiones de cuenta.
</details>

<details>
  <summary><b>🪐 Probar el Bot Oficial</b></summary>
  <br>
  Si quieres ver el bot en funcionamiento antes de instalarlo en tu propio servidor, puedes unirte a cualquiera de nuestros enlaces oficiales en la barra de accesos directos de arriba. ¡Por favor, evita el spam!
</details>

---

## 🍃 Descripción del Proyecto

**INFINITY - WA - BOT** es un software modular multifuncional para WhatsApp automatizado mediante Node.js. Diseñado bajo un concepto de alto rendimiento y código limpio, ofrece herramientas avanzadas de gestión grupal, sistemas de entretenimiento interactivo (RPG, Gacha), descargas multimedia optimizadas y respuestas inteligentes en tiempo real.

---

## 🛠️ Características Principales

- [x] **Gestión de Grupos Avanzada:** Herramientas de moderación automatizada como Antilink, Antifake, mensajes de bienvenida/despedida configurables y administración de usuarios.
- [x] **Descargas Multimedia:** Extracción directa de contenido de alta velocidad desde plataformas como YouTube, TikTok e Instagram libre de marcas de agua.
- [x] **Motor de Stickers:** Conversión dinámica de imágenes, vídeos de corta duración y archivos GIF en stickers en cuestión de segundos.
- [x] **Módulo de Entretenimiento:** Sistemas interactivos de juegos integrados como trivias, retos matemáticos y mecánicas RPG de colección.
- [x] **Inteligencia Artificial:** Respuestas contextuales fluidas simulando un entorno conversacional automatizado interactivo.
- [x] **Arquitectura Eficiente:** Ejecución ligera construida para garantizar un consumo mínimo de recursos de red y procesador.

---

## 📦 Guía de Instalación Manual (Termux)

> ⚠️ **Importante:** Copia y ejecuta los siguientes comandos **uno por uno** para evitar fallos durante la compilación de dependencias.

### Paso 1: Configurar el acceso al almacenamiento del dispositivo

```bash
termux-setup-storage
```

### Paso 2: Actualizar el árbol de paquetes del sistema

```bash
apt update && apt upgrade -y
```

### Paso 3: Instalar los lenguajes y dependencias del sistema requeridas

```bash
pkg install git nodejs ffmpeg imagemagick yarn -y
```

### Paso 4: Clonar el repositorio oficial de GitHub

```bash
git clone https://github.com/Anzzdskk/INFINITY
```

### Paso 5: Acceder al directorio del proyecto clonado

```bash
cd INFINITY
```

### Paso 6: Instalar los módulos de Node de forma limpia con Yarn

```bash
yarn install
```

### Paso 7: Instalar dependencias secundarias complementarias

```bash
npm install
```

### Paso 8: Iniciar la ejecución del Bot por primera vez

```bash
npm start
```

---

## 🔄 Comandos de Utilidad y Mantenimiento

<details>
<summary><b>🌀 Reactivación básica</b></summary>

Si el proceso del bot se detiene por inactividad o reinicio del dispositivo, accede al directorio y ejecútalo de nuevo:

```bash
cd INFINITY 
```

```bash
npm start
```

</details>

<details>
<summary><b>🔁 Ejecución Continua (Modo 24/7 con PM2)</b></summary>

Para evitar que el proceso muera al cerrar Termux en tu teléfono móvil, utiliza un administrador de procesos en segundo plano:

```bash
termux-wake-lock
```

```bash
npm i -g pm2
```

```bash
pm2 start index.js
```

```bash
pm2 save
```

```bash
pm2 logs
```

</details>

<details>
<summary><b>🆕 Forzar Generación de un Nuevo Código QR</b></summary>

Si necesitas vincular un número telefónico diferente, elimina los datos de sesión almacenados antes de iniciar:

```bash
cd INFINITY 
```

```bash
rm -rf Sessions
```

```bash
npm start
```

</details>

<details>
<summary><b>⬆️ Actualizar el Bot a la Última Versión</b></summary>

Descarga los cambios más recientes añadidos al repositorio sin perder tus configuraciones:

```bash
git pull
```

```bash
npm install
```

```bash
npm start
```

</details>

<details>
<summary><b>👑 Configurar tu Número como Owner / Propietario</b></summary>

Para tener control total de los comandos administrativos del bot, edita el archivo de ajustes con el editor integrado en la consola de Termux:

```bash
cd INFINITY && nano settings.js
```

*(Modifica las líneas de los números asignados al owner, guarda los cambios presionando Ctrl + O, confirma con Enter y sal con Ctrl + X).*

</details>

---

## 🍁 Métodos de Despliegue Alternativos

Si cuentas con servidores en la nube o prefieres utilizar plataformas PaaS para alojar el bot de forma permanente sin depender de tu dispositivo móvil, cuentas con las siguientes alternativas listadas:

### 🟢 Despliegue en GitHub Codespaces

<a href="https://github.com/codespaces">
  <img src="https://github.com/codespaces/badge.svg" height="38px" alt="Deploy to Codespaces">
</a>

### ⚡ Despliegue en Replit PaaS

<a href="https://replit.com">
  <img src="https://repl.it/badge/github.com/Anzzdskk/INFINITY" height="38px" alt="Deploy to Replit">
</a>

### 🤍 Despliegue en Render Cloud

<a href="https://render.com">
  <img src="https://render.com/images/deploy-to-render-button.svg" height="38px" alt="Deploy to Render">
</a>

---

## 🌌 Entorno Tecnológico

Las principales tecnologías implementadas en el desarrollo de este ecosistema modular son:

<p align="left">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Baileys_MD-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys">
  <img src="https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white" alt="Yarn">
</p>

---

## 🤝 Contacto y Soporte Técnico

Si requieres asistencia avanzada, reportar fallas en los módulos o proponer nuevas integraciones para futuras actualizaciones del bot:

- 📧 **Correo Electrónico:** anzzzdsk@gmail.com

---

## 👑 Desarrollador Principal y Créditos

<div align="center">
  <img src="https://files.catbox.moe/z13zec.jpeg" width="120" height="120">
  
  <h3>Anzz-᭄</h3>
  
  <p><b>Encargado del Proyecto & Desarrollador Principal</b></p>
</div>

---

<p align="center">
  <i>Si este software te resulta de utilidad y te agrada, apoya nuestro trabajo dándole una 🌟 estrella a este repositorio. ¡Muchas gracias!</i>
</p>

  <sub>© 2026 INFINITY WA - BOT</sub>
</div>