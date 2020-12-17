const DOCKERFILE_COMMANDS = ['FROM', 'CMD', 'ADD', 'ENV', 'COPY', 'WORKDIR', 'LABEL', 'EXPOSE', 'USER', 'ENTRYPOINT', 'RUN', 'MAINTAINER', 'STOPSIGNAL']

export function formatDockerfile (content: string): string {
  content = content.split('\n').join('<br/>')
  DOCKERFILE_COMMANDS.forEach((command: string) => {
    content = content.split(`${command}`).join(`<span class="dockerfile-command">${command}</span>`)
  })
  return content
}