<?php
const LOGINS_FILE = __DIR__ . '/logins.json';

function voltar(string $msg): never {
    echo "<script>alert(" . json_encode($msg) . "); window.location.href='/cadastro.html';</script>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /cadastro.html');
    exit;
}

$nome  = trim($_POST['nome'] ?? '');
$email = trim($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';

if ($nome === '' || $senha === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    voltar('Preencha nome, email válido e senha.');
}


$fp = fopen(LOGINS_FILE, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    voltar('Erro ao acessar o arquivo de usuários.');
}

$users = json_decode(stream_get_contents($fp), true) ?: [];

foreach ($users as $u) {
    if (strcasecmp($u['email'] ?? '', $email) === 0) {
        flock($fp, LOCK_UN);
        fclose($fp);
        voltar('Este email já está cadastrado.');
    }
}

$users[] = [
    'name'  => $nome,
    'email' => $email,
    'senha' => password_hash($senha, PASSWORD_DEFAULT),   
];

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);


header('Location: /index.html');
exit;
