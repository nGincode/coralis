<?php

namespace App\Controllers;

use App\Models\Users as ModelsUsers;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\RESTful\ResourceController;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Auth extends ResourceController
{
    use ResponseTrait;

    public function __construct()
    {
    }

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

        $key = getenv('TOKEN_SECRET');
        $payload = [
            'uuid' => $data['uuid'],
            'name' => $data['name'],
            'email' => $data['email']
        ];
        $token = JWT::encode($payload, $key, 'HS256');

        if ($this->emailverif($this->request->getVar('email'), $this->request->getVar('name'), $uuid->toString()) == 'success') {
            $response = [
                'status' => 201,
                'error' => null,
                'messages' => "Created successfull",
                'token' =>  $token
            ];
            return $this->respondCreated($response);
        } else {
            $response = [
                'status' => 201,
                'error' => null,
                'messages' => "Email not send",
                'token' =>  $token
            ];
            return $this->respondCreated($response);
        }
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


    public function emailSend()
    {
        if ($this->request->getVar('email')) {
            $email = $this->request->getVar('email');
            $username = $this->request->getVar('username');
            $uuid = $this->request->getVar('uuid');

            // Instantiation and passing `true` enables exceptions
            $mail = new PHPMailer(true);

            try {
                //Server settings

                $mail->isSMTP();                                            // Send using SMTP
                $mail->Host       = 'mail.primarasaselaras.com';                    // Set the SMTP server to send through
                $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
                $mail->Username   = 'test@primarasaselaras.com';                     // SMTP username
                $mail->Password   = 'jorNJq^yEc2+mAsz';                               // SMTP password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
                $mail->Port       = 587;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

                //Recipients
                $mail->setFrom('test@primarasaselaras.com', 'primarasaselaras.com');
                $mail->addAddress($email);

                $link = base_url('api/emailActivation?verif=');

                // Content 
                $message = file_get_contents('assets/emailVeri.html');
                $message = str_replace('%username%', $username, $message);
                $message = str_replace('%activation%', $uuid, $message);
                $message = str_replace('%link%', $link, $message);
                $mail->isHTML(true);                                  // Set email format to HTML
                $mail->Subject = 'Verify Email Account Created';
                $mail->MsgHTML($message);

                $mail->send();
                return 'success';
            } catch (Exception $e) {
                return $mail->ErrorInfo;
            }
        } else {
            return false;
        }
    }

    private function get_client_ip()
    {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if (getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if (getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if (getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if (getenv('HTTP_FORWARDED'))
            $ipaddress = getenv('HTTP_FORWARDED');
        else if (getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'IP tidak dikenali';
        return $ipaddress;
    }
    private function emailVerif($email, $username, $activation)
    {

        // Instantiation and passing `true` enables exceptions
        $mail = new PHPMailer(true);

        try {
            //Server settings

            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'mail.primarasaselaras.com';                    // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'test@primarasaselaras.com';                     // SMTP username
            $mail->Password   = 'jorNJq^yEc2+mAsz';                               // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port       = 587;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

            //Recipients
            $mail->setFrom('test@primarasaselaras.com', 'primarasaselaras.com');
            $mail->addAddress($email);

            $link = base_url('api/emailActivation?verif=');

            // Content 
            $message = file_get_contents('assets/emailVeri.html');
            $message = str_replace('%username%', $username, $message);
            $message = str_replace('%activation%', $activation, $message);
            $message = str_replace('%link%', $link, $message);
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Verify Email Account Created';
            $mail->MsgHTML($message);

            $mail->send();
            return 'success';
        } catch (Exception $e) {
            return $mail->ErrorInfo;
        }
    }
    private function emailPassReset($email, $username, $activation)
    {

        // Instantiation and passing `true` enables exceptions
        $mail = new PHPMailer(true);

        try {
            //Server settings

            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'mail.primarasaselaras.com';                    // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'test@primarasaselaras.com';                     // SMTP username
            $mail->Password   = 'jorNJq^yEc2+mAsz';                               // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port       = 587;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

            //Recipients
            $mail->setFrom('test@primarasaselaras.com', 'primarasaselaras.com');
            $mail->addAddress($email);


            $link = base_url('?resetPass=' . $activation);

            $ip = $this->get_client_ip();

            // Content 
            $message = file_get_contents('assets/resetPass.html');
            $message = str_replace('%username%', $username, $message);
            $message = str_replace('%activation%', $activation, $message);
            $message = str_replace('%ipaddress%', $ip, $message);
            $message = str_replace('%email%', $email, $message);
            $message = str_replace('%link%', $link, $message);
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Reset Password Account';
            $mail->MsgHTML($message);

            $mail->send();
            return 'success';
        } catch (Exception $e) {
            return $mail->ErrorInfo;
        }
    }

    public function emailActivation()
    {
        $model = new ModelsUsers();
        $uuid = $this->request->getVar('verif');
        if ($data = $model->where('uuid', $uuid)->first()) {
            $model = new ModelsUsers();
            $model->update($data['id'], ['email_verified_at' => date('Y-m-d H:i:s')]);
            return "Email Verifed <script>setTimeout(() => {window.location.href = '/';}, 1000);</script>";
        } else {
            return 'Error Email Verifed';
        }
    }

    public function forgotPass()
    {
        $model = new ModelsUsers();
        $data = $model->where('email', $this->request->getVar('email'))->first();
        if ($data) {
            if ($this->emailPassReset($this->request->getVar('email'), $data['name'], $data['uuid']) == 'success') {
                $response = [
                    'status' => 201,
                    'error' => null,
                    'messages' => "Email Sent, Cek Your Email",
                ];
                return $this->respondCreated($response);
            } else {
                $response = [
                    'status' => 201,
                    'error' => null,
                    'messages' => "Email not sent"
                ];
                return $this->respondCreated($response);
            }
        } else {
            return $this->failNotFound('Email not found');
        }
    }

    public function resetPass()
    {
        $model = new ModelsUsers();
        $uuid = $this->request->getVar('uuid');
        if ($data = $model->where('uuid', $uuid)->first()) {
            $model = new ModelsUsers();
            $model->update($data['id'], ['password' => password_hash($this->request->getVar('password'), PASSWORD_BCRYPT)]);
            return $this->respond([
                'status' => 201,
                'error' => null,
                'messages' => "Password update successfull",

            ]);
        } else {
            return $this->failNotFound('id not found');
        }
    }
}
