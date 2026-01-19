import AppRouter from './app/router/AppRouter';
import InstallPrompt from './components/PWA/InstallPrompt'; 
import OfflineStatus from './components/PWA/OfflineStatus';

function App() {
  return (<> 

   <OfflineStatus />
   <AppRouter /> 

    <InstallPrompt />
  </>)
 
}

export default App;