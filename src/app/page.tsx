"use client";
import LateralMenuComponent from "./components/lateralMenuComponent";
import ThreeJSSceneComponent from "./components/threeJSSceneComponent";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { store } from './store'
import { Provider, useSelector } from 'react-redux'
import ModalComponent from "./components/modalComponent";
config.autoAddCss = false;

export default function Home() {
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
