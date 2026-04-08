import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { AuthorsPage } from './pages/AuthorsPage';
import { AuthorPage } from './pages/AuthorPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { BoostyLevelsPage } from './pages/BoostyLevelsPage';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <IonApp>
          <IonReactHashRouter>
            <IonRouterOutlet>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/authors" component={AuthorsPage} />
              <Route exact path="/levels" component={BoostyLevelsPage} />
              <Route exact path="/author/:authorId" component={AuthorPage} />
              <Route exact path="/book/:bookId" component={BookDetailsPage} />
            </IonRouterOutlet>
          </IonReactHashRouter>
        </IonApp>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
