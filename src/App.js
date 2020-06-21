import React, {lazy, Suspense} from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route
} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Loader from './components/Loader/Loader'
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
const Home = lazy(() => import('./components/Home/Home'));
const HumanVsEngine = lazy(() => import('./components/Game/HumanVsEngine'));
const Analysis = lazy(() => import('./components/Game/Analysis'));

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />
				<main>
					<ToastContainer />
					<Suspense fallback={<Loader />}>
						<Switch>
							<Route exact path="/" component={Home} />
							<Route exact path="/ai" component={HumanVsEngine} />
							<Route exact path="/analysis" component={Analysis} />
						</Switch>
					</Suspense>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
