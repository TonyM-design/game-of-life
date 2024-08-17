

import { configureStore } from '@reduxjs/toolkit'
import gridParametersReducer from './components/lateralPanels/reducers/gridParametersReducer'
import controllerParameterReducer from './components/lateralPanels/reducers/controllerParameterReducer'
export const store = configureStore({
    reducer: {
        grid : gridParametersReducer,
        game : controllerParameterReducer
    },
  })
  
  // Infer the `RootState` and `AppDispatch` types from the store itself
  export type RootState = ReturnType<typeof store.getState>
  // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
  export type AppDispatch = typeof store.dispatch