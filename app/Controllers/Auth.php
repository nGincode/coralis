<?php

namespace App\Controllers;

use App\Models\Users as ModelsUsers;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\RESTful\ResourceController;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth extends ResourceController
{
    use ResponseTrait;

    public function login()
    {
        helper(['form']);
        $rules = [
            'email' => 'required|valid_email',
            'password' => 'required|min_length[8]',
        ];
        if (!$this->validate($rules)) return $this->fail($this->validator->getErrors());

        $model = new ModelsUsers();
        $users = $model->where('email', $this->request->getVar('email'))->first();
        if (!$users) return $this->failNotFound('Email not found');

        $verify = password_verify($this->request->getVar('password'), $users['password']);

        if (!$verify) return $this->fail('Wrong password');


        $key = getenv('TOKEN_SECRET');
        $payload = [
            'uuid' => $users['uuid'],
            'name' => $users['name'],
            'email' => $users['email']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        return $this->respond([
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => "Token created successfull",
            ],
            'token' => $token
        ]);
    }

    public function register()
    {
        helper(['form']);
        $uuid = Uuid::uuid4();

        $rules = [
            'name' => 'required|is_unique[users.name]',
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]',
            'passconf' => 'required|matches[password]',
        ];

        if (!$this->validate($rules)) return $this->fail($this->validator->getErrors());

        $data = [
            'name' => $this->request->getVar('name'),
            'uuid' => $uuid->toString(),
            'password' => password_hash($this->request->getVar('password'), PASSWORD_BCRYPT),
            'email' => $this->request->getVar('email'),
            'img' => null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        $model = new ModelsUsers();
        $model->save($data);
        $response = [
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => "created successfull",
            ]
        ];
        return $this->respondCreated($response);
    }

    public function cekToken()
    {
        $key = getenv("TOKEN_SECRET");
        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        if (!$header) return $this->failUnauthorized('Token Required');
        $token = explode(' ', $header)[1];

        try {
            $decode = JWT::decode($token, new Key($key, 'HS256'));
            return $this->respond($decode);
        } catch (\Throwable $th) {
            return $this->fail('Invalid token');
        }
    }
}
