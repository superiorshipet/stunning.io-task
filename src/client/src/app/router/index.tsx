import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App';
import { LandingPage } from '@/features/builder/pages/LandingPage';
import { MyBuildsPage } from '@/features/builds/pages/MyBuildsPage';
import { SavedBuildDetailPage } from '@/features/builds/pages/SavedBuildDetailPage';
import { HowItWorksPage } from '@/features/builder/pages/HowItWorksPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'builds',
        element: <MyBuildsPage />,
      },
      {
        path: 'builds/:id',
        element: <SavedBuildDetailPage />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorksPage />,
      },
    ],
  },
]);
