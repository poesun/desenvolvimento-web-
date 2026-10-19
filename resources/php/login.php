<?php
session_start();
const LOGINS_FILE = __DIR__ . '/logins.json';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /index.html');
    exit;
}

$email = trim($_POST['email'] ?? '');
$senha = $_POST['senha'] ?? '';
$users = json_decode(@file_get_contents(LOGINS_FILE), true) ?: [];

foreach ($users as $i => $user) {
    if (strcasecmp($user['email'] ?? '', $email) !== 0) {
        continue;
    }

    $salva = $user['senha'] ?? '';
    $ehHash = str_starts_with($salva, '$2y$');
    $ok = $ehHash ? password_verify($senha, $salva) : hash_equals($salva, $senha);

    if ($ok) {
        // migra automaticamente senhas antigas (texto puro) para hash no primeiro login
        if (!$ehHash) {
            $users[$i]['senha'] = password_hash($senha, PASSWORD_DEFAULT);
            file_put_contents(LOGINS_FILE, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        session_regenerate_id(true);
        $_SESSION['usuario'] = $user['name'] ?? $email;
        header('Location: /aaa.html');
        exit;                       // antes não havia exit, e havia um 'echo' depois do header
    }
}

echo "<script>alert('Email ou senha incorreto!!!'); window.location.href='/index.html';</script>";
