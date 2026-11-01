import { spawnSync } from 'node:child_process';
import path from 'node:path';

const git = (args, { cwd, quiet = false } = {}) => {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.error) throw result.error;
  return result;
};

const gitOutput = (args, cwd) => {
  const result = git(args, { cwd, quiet: true });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args[0]} falhou.`);
  }
  return result.stdout.trim();
};

const fail = (message) => {
  console.error(`Erro: ${message}`);
  process.exitCode = 1;
};

async function main() {
  const requestedPaths = process.argv.slice(2);
  if (requestedPaths.length === 0) {
    throw new Error('Informe um ou mais arquivos. Ex.: npm run publish:files -- index.html readme.md');
  }

  const repoRoot = gitOutput(['rev-parse', '--show-toplevel'], process.cwd());
  const branch = gitOutput(['branch', '--show-current'], repoRoot);
  if (!branch) throw new Error('O HEAD está destacado; troque para uma branch antes de publicar.');

  gitOutput(['remote', 'get-url', 'origin'], repoRoot);
  const staged = git(['diff', '--cached', '--quiet'], { cwd: repoRoot, quiet: true });
  if (staged.status !== 0) {
    throw new Error('Há alterações já preparadas no Git. Faça commit delas ou retire-as da stage antes de continuar.');
  }

  const fetch = git(['fetch', '--quiet', '--no-tags', 'origin', branch], { cwd: repoRoot });
  if (fetch.status !== 0) throw new Error('Não foi possível atualizar a referência do GitHub; nenhum arquivo foi enviado.');

  const localHead = gitOutput(['rev-parse', 'HEAD'], repoRoot);
  const remoteHead = gitOutput(['rev-parse', 'FETCH_HEAD'], repoRoot);
  if (localHead !== remoteHead) {
    throw new Error(`A branch local '${branch}' difere da origin/${branch}. Sincronize-a antes de publicar.`);
  }

  const files = requestedPaths.map((requestedPath) => {
    const absolutePath = path.resolve(process.cwd(), requestedPath);
    const relativePath = path.relative(repoRoot, absolutePath);
    if (
      !relativePath
      || relativePath === '..'
      || relativePath.startsWith(`..${path.sep}`)
      || path.isAbsolute(relativePath)
      || relativePath.split(path.sep)[0] === '.git'
    ) {
      throw new Error(`Caminho fora do repositório ou inválido: ${requestedPath}`);
    }
    return relativePath.split(path.sep).join('/');
  });

  if (new Set(files).size !== files.length) {
    throw new Error('A lista contém arquivos repetidos.');
  }

  for (const file of files) {
    const status = git(['status', '--porcelain', '--untracked-files=all', '--', file], {
      cwd: repoRoot,
      quiet: true,
    });
    if (status.status !== 0) throw new Error(`Não foi possível verificar ${file}.`);
    if (!status.stdout.trim()) {
      console.log(`Sem alterações: ${file}`);
      continue;
    }

    const add = git(['add', '-A', '--', file], { cwd: repoRoot });
    if (add.status !== 0) throw new Error(`Não foi possível preparar ${file}.`);

    const stagedFiles = gitOutput(['diff', '--cached', '--name-only', '-z'], repoRoot)
      .split('\0')
      .filter(Boolean);
    if (stagedFiles.length !== 1 || stagedFiles[0] !== file) {
      git(['reset', '--quiet'], { cwd: repoRoot });
      throw new Error(`A alteração de ${file} afeta mais de um caminho; ela não foi commitada.`);
    }

    const commit = git([
      'commit',
      '-m',
      `Update ${file}`,
      '-m',
      'Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>',
    ], { cwd: repoRoot });
    if (commit.status !== 0) throw new Error(`O commit de ${file} falhou; revise a stage antes de continuar.`);

    const push = git(['push', 'origin', `HEAD:refs/heads/${branch}`], { cwd: repoRoot });
    if (push.status !== 0) {
      const commitHash = gitOutput(['rev-parse', '--short', 'HEAD'], repoRoot);
      throw new Error(
        `O commit ${commitHash} (${file}) foi criado localmente, mas o push falhou. `
        + `Resolva o problema e envie-o com: git push origin ${branch}`,
      );
    }

    const commitHash = gitOutput(['rev-parse', '--short', 'HEAD'], repoRoot);
    console.log(`Publicado ${commitHash}: ${file}`);
  }
}

main().catch(fail);
