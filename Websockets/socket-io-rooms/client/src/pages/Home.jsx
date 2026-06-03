import { Link } from 'react-router-dom';

function Home() {

    return (
        <div>

            <h1>Study Portal</h1>

            <p>
                No WebSocket connection exists here.
            </p>

            <Link to="/room">
                Join Study Room
            </Link>

        </div>
    );
}

export default Home;