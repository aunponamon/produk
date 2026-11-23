<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

function read_input(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function validate_product(array $in): array
{
    $errors = [];
    $kode = trim((string) ($in['kode'] ?? ''));
    $nama = trim((string) ($in['nama'] ?? ''));
    $kategori = trim((string) ($in['kategori'] ?? ''));
    $harga = $in['harga'] ?? null;
    $stok = $in['stok'] ?? null;

    if ($kode === '') {
        $errors['kode'] = 'Kode wajib diisi';
    } elseif (mb_strlen($kode) > 50) {
        $errors['kode'] = 'Kode maksimal 50 karakter';
    }
    if ($nama === '') {
        $errors['nama'] = 'Nama wajib diisi';
    } elseif (mb_strlen($nama) > 150) {
        $errors['nama'] = 'Nama maksimal 150 karakter';
    }
    if (mb_strlen($kategori) > 100) {
        $errors['kategori'] = 'Kategori maksimal 100 karakter';
    }
    if (!is_numeric($harga) || (float) $harga < 0) {
        $errors['harga'] = 'Harga harus berupa angka >= 0';
    }
    if (!is_numeric($stok) || (int) $stok != $stok || (int) $stok < 0) {
        $errors['stok'] = 'Stok harus berupa bilangan bulat >= 0';
    }

    $clean = [
        'kode' => $kode,
        'nama' => $nama,
        'kategori' => $kategori,
        'harga' => is_numeric($harga) ? (float) $harga : 0,
        'stok' => is_numeric($stok) ? (int) $stok : 0,
    ];
    return [$clean, $errors];
}

function find_product(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM products WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

try {
    switch ($method) {
        case 'GET':
            if ($id > 0) {
                $row = find_product($id);
                if (!$row) {
                    json_response(['message' => 'Produk tidak ditemukan'], 404);
                }
                json_response($row);
            }
            $rows = db()->query('SELECT * FROM products ORDER BY id DESC')->fetchAll();
            json_response($rows);
            break;

        case 'POST':
            [$data, $errors] = validate_product(read_input());
            if ($errors) {
                json_response(['message' => 'Data tidak valid', 'errors' => $errors], 422);
            }
            $stmt = db()->prepare(
                'INSERT INTO products (kode, nama, kategori, harga, stok) VALUES (:kode, :nama, :kategori, :harga, :stok)'
            );
            $stmt->execute($data);
            json_response(find_product((int) db()->lastInsertId()), 201);
            break;

        case 'PUT':
            if ($id <= 0) {
                json_response(['message' => 'ID wajib diisi'], 400);
            }
            if (!find_product($id)) {
                json_response(['message' => 'Produk tidak ditemukan'], 404);
            }
            [$data, $errors] = validate_product(read_input());
            if ($errors) {
                json_response(['message' => 'Data tidak valid', 'errors' => $errors], 422);
            }
            $data['id'] = $id;
            $stmt = db()->prepare(
                'UPDATE products SET kode = :kode, nama = :nama, kategori = :kategori, harga = :harga, stok = :stok WHERE id = :id'
            );
            $stmt->execute($data);
            json_response(find_product($id));
            break;

        case 'DELETE':
            if ($id <= 0) {
                json_response(['message' => 'ID wajib diisi'], 400);
            }
            if (!find_product($id)) {
                json_response(['message' => 'Produk tidak ditemukan'], 404);
            }
            $stmt = db()->prepare('DELETE FROM products WHERE id = :id');
            $stmt->execute(['id' => $id]);
            json_response(['message' => 'Produk dihapus']);
            break;

        default:
            json_response(['message' => 'Method tidak diizinkan'], 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_response(['message' => 'Kode produk sudah digunakan', 'errors' => ['kode' => 'Kode produk sudah digunakan']], 409);
    }
    json_response(['message' => 'Kesalahan database'], 500);
}
