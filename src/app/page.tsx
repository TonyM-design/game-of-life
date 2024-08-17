"use client";

import HomeComponent from "./components/homeComponent";
import LateralMenuComponent from "./components/lateralMenuComponent";
import ThreeJSSceneComponent from "./components/threeJSSceneComponent";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { store } from './store'
import { Provider } from 'react-redux'
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false;

export default function Home() {
  // ajouter la gestion des état parametre via reducer ou useState ? 
  return (
    <Provider store={store}>
      <main className="absolute">
        <LateralMenuComponent />
        <ThreeJSSceneComponent />
      </main>
      </Provider>
  );
}
