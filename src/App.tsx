import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { AuthorPage } from './pages/AuthorPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { ReaderPage } from './pages/ReaderPage';
import { AuthPage } from './pages/AuthPage';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/favorites" component={FavoritesPage} />
              <Route exact path="/authors" component={AuthorsPage} />
              <Route exact path="/author/:authorId" component={AuthorPage} />
              <Route exact path="/auth" component={AuthPage} />
              <Route exact path="/book/:bookId" component={BookDetailsPage} />
              <Route exact path="/reader/:bookId/:chapterId" component={ReaderPage} />
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;