import React, { useState } from 'react';
import LoginForm from '../molecules/LoginForm/Login';

const LoginPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return(
        <LoginForm username={username} password={password}/>
    );
};

export default LoginPage;