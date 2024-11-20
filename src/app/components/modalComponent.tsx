import { faCircleXmark, faClose, faForward, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useDispatch, useSelector } from "react-redux"
import { setDownloadModalIsOpen, setUploadModalIsOpen, selectUploadModalIsOpen } from "../reducers/controllerParameterReducer"
import { useFormik } from "formik";
import { useState } from "react";
import * as THREE from 'three';
import { setBirthRate, setIs3dGrid, setLonelinessLimit, setSurpopulationLimit } from "../reducers/gridParametersReducer";
import { setCellPositions } from "../reducers/globalGameReducer";


function modalComponent() {
  const dispatch = useDispatch()
  const uploadModalIsOpen = useSelector(selectUploadModalIsOpen)

  interface LoadedRules {
    zAxis: boolean,
    birthRate: number,
    surpopulation: number,
    loneliness: number,
  }

  interface LoadedData {
    rule: LoadedRules;
    cellPositions: string[];
  }


  const updateLocalRule = (importedData: LoadedData) => {
    dispatch(setIs3dGrid(importedData.rule.zAxis))
    dispatch(setBirthRate(importedData.rule.birthRate))
    dispatch(setSurpopulationLimit(importedData.rule.surpopulation))
    dispatch(setLonelinessLimit(importedData.rule.loneliness))
  }

  const updateLocalData = (importedData: LoadedData) => {
    dispatch(setCellPositions(importedData.cellPositions))
  }



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {

        const fileContent = e.target?.result as string;
   
        const jsonData = JSON.parse(fileContent);
        updateLocalRule(jsonData)
        updateLocalData(jsonData)

      };
      reader.readAsText(file);
    }
  };

  const closeModal = () => {
    dispatch(setUploadModalIsOpen(false))
  }

  const confirmModal = () => {
    dispatch(setUploadModalIsOpen(false));
    }
  


  return (<>
    {uploadModalIsOpen ?
      <div className=' h-screen w-screen absolute z-100 top-0  flex items-center backdrop-blur-sm bg-slate-500/10 backdrop-brightness-50    '>
        <div className=" flex w-full  justify-center  -mt-56 p-10 ">
          <div className="  px-10 py-6  bg-slate-700 bg-opacity-80 border-4 border-white border-y-0 border-r-0  ">
            <p className="text-center text-xl text-slate-300 font-bold">Load file</p>
            <hr className="border-slate-600 mt-2" />
            <input onChange={handleFileUpload} type="file" accept="application/json" name="loadingFile" className="mt-5 block w-full text-sm outline-none text-slate-500
        file:mr-4 file:py-2 file:px-4 
        file:border file:border-slate-400 file:text-slate-300 file:hover:bg-slate-300 file:hover:text-slate-700 file:shadow-none file:text-sm file:font-semibold
        file:bg-transparent file:cursor-pointer
       " />
            <button onClick={confirmModal} className="text-slate-300 text-xl w-full p-2.5 border border-slate-300 mt-5 hover:bg-slate-300 hover:text-slate-700">Confirm</button>

          </div>

          <FontAwesomeIcon onClick={closeModal} className=" my-36 top-0 text-2xl text-white -mt-5 cursor-pointer "
            icon={faXmark}
          />

        </div>
      </div> : null}</>
  )

}
export default modalComponent