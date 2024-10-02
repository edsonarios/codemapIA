export function getExplainPrompt(
  language: string,
  structure: Record<string, string[]>,
  nameFile: string,
  contentFile: string,
) {
  if (language === 'ES') {
    return `Tengo un proyecto con la siguiente estructura:
${structure}
Quiero que me expliques el archivo ${nameFile} cuyo contenido es:
${contentFile}
Primero, dame un breve resumen del archivo. Luego, explica su relación y propósito dentro del proyecto en general.
Asegurate de responderme en formato html como en el ejemplo que te mandare a continuacion.
Este es un ejemplo de output que quiero,
<div>
  <p>
    El archivo <strong>tsconfig.json</strong> configura el compilador TypeScript para el proyecto.
  </p>
  <br />

  <h3><strong>Opciones Principales:</strong></h3>
  <ul>
    <li><strong>allowJs:</strong> Permite compilar JavaScript.</li>
    <li><strong>strict:</strong> Activa verificaciones estrictas.</li>
    <li><strong>target:</strong> Compila a ECMAScript 2022.</li>
    <li><strong>lib:</strong> Usa bibliotecas de ECMAScript 2023.</li>
    <li><strong>moduleResolution:</strong> Estrategia de resolución de módulos Node.</li>
  </ul>
  <br />

  <h3><strong>Exclusiones:</strong></h3>
  <ul>
    <li>Excluye <strong>node_modules</strong> y <strong>cdk.out</strong>.</li>
  </ul>
  <br />

  <h3><strong>Relación con el Proyecto:</strong></h3>
  <p>
    <strong>tsconfig.json</strong> asegura que el código TypeScript se compile correctamente, siguiendo los estándares del proyecto.
  </p>
  <br />
  <ul>
    <li>Compila de manera consistente los archivos en <strong>src/</strong> y <strong>cdk/</strong>.</li>
    <li>Facilita el uso de decoradores y metadatos para funcionalidades avanzadas.</li>
  </ul>
</div>`
  }
  return `I have a project with the following structure: ${structure}
I want you to explain the file ${nameFile} whose content is: ${contentFile}
First, give me a brief summary of the file. Then, explain its relationship and purpose within the project in general.
Make sure to answer me in html format as in the example I will send you below.
This is an example of output that I want,
<div>
  <p>
    The file <strong>tsconfig.json</strong> configures the TypeScript compiler for the project.
  </p>
  <br />

  <h3><strong>Main Options:</strong></h3>
  <ul>
    <li><strong>allowJs:</strong> Allows compiling JavaScript.</li>
    <li><strong>strict:</strong> Activates strict checks.</li>
    <li><strong>target:</strong> Compiles to ECMAScript 2022.</li>
    <li><strong>lib:</strong> Uses ECMAScript 2023 libraries.</li>
    <li><strong>moduleResolution:</strong> Node module resolution strategy.</li>
  </ul>
  <br />

  <h3><strong>Exclusions:</strong></h3>
  <ul>
    <li>Excludes <strong>node_modules</strong> and <strong>cdk.out</strong>.</li>
  </ul>
  <br />

  <h3><strong>Relationship with the Project:</strong></h3>
  <p>
    <strong>tsconfig.json</strong> ensures that TypeScript code compiles correctly, following project standards.
  </p>
  <br />
  <ul>
    <li>Consistently compiles files in <strong>src/</strong> and <strong>cdk/</strong>.</li>
    <li>Facilitates the use of decorators and metadata for advanced functionalities.</li>
  </ul>
</div>`
}
