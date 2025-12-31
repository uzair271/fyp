import { AppProvider } from './context/AppContext'
import AppRoutes from './AppRoutes'
import { ServiceProvider } from './context/ServiceContext'


function App() {
  return (
    <ServiceProvider>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </ServiceProvider>
  );
}

export default App

