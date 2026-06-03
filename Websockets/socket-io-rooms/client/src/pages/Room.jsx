import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    connectSocket,
    disconnectSocket
} from '../services/socket';

function Room() {

    const [students, setStudents] = useState(0);

    useEffect(() => {
            console.log("first")

        const socket = connectSocket();

        socket.on('count-update', (count) => {
            setStudents(count);
            console.log("second")
        });

        return () => {

            socket.off('count-update');

            disconnectSocket();
        };

    }, []);

    return (
        <div>

            <h1>Study Room</h1>

            <h2>
                Students Online: {students}
            </h2>

            <Link to="/">
                Leave Room
            </Link>

        </div>
    );
}

export default Room;