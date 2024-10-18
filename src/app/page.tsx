"use client";

import HomeComponent from "./components/homeComponent";
import LateralMenuComponent from "./components/lateralMenuComponent";
import ThreeJSSceneComponent from "./components/threeJSSceneComponent";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { store } from './store'
import { Provider, useSelector } from 'react-redux'
import ModalComponent from "./components/modalComponent";
import { selectModalIsOpen } from "./components/lateralPanels/reducers/controllerParameterReducer";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false;

export default function Home() {
  // ajouter la gestion des état parametre via reducer ou useState ? 
  return (
    <Provider store={store}>
      <main className="absolute">
       <ModalComponent></ModalComponent> 

        <LateralMenuComponent />
        <ThreeJSSceneComponent />
      </main>
      </Provider>
  );
}
