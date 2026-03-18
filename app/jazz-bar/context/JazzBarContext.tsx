'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

type JazzBarState = {
  currentStep: 'start' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'result'
  mixingParams: {
    base_spirit: string | null
    ingredients: string[]
    mood: string | null
    mood_intensity: number
    ice_level: string | null
    shake_level: string | null
  }
  currentTrack: any | null
  isPlaying: boolean
  isLoading: boolean
}

type JazzBarAction =
  | { type: 'SET_STEP'; step: JazzBarState['currentStep'] }
  | { type: 'SET_BASE_SPIRIT'; spirit: string }
  | { type: 'TOGGLE_INGREDIENT'; ingredient: string }
  | { type: 'SET_MOOD'; mood: string; intensity: number }
  | { type: 'SET_ICE_LEVEL'; level: string }
  | { type: 'SET_SHAKE_LEVEL'; level: string }
  | { type: 'SET_TRACK'; track: any }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'RESET' }

function jazzBarReducer(state: JazzBarState, action: JazzBarAction): JazzBarState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_BASE_SPIRIT':
      return {
        ...state,
        mixingParams: { ...state.mixingParams, base_spirit: action.spirit }
      }

    case 'TOGGLE_INGREDIENT':
      const hasIngredient = state.mixingParams.ingredients.includes(action.ingredient)
      return {
        ...state,
        mixingParams: {
          ...state.mixingParams,
          ingredients: hasIngredient
            ? state.mixingParams.ingredients.filter(i => i !== action.ingredient)
            : [...state.mixingParams.ingredients, action.ingredient]
        }
      }

    case 'SET_MOOD':
      return {
        ...state,
        mixingParams: {
          ...state.mixingParams,
          mood: action.mood,
          mood_intensity: action.intensity
        }
      }

    case 'SET_ICE_LEVEL':
      return {
        ...state,
        mixingParams: { ...state.mixingParams, ice_level: action.level }
      }

    case 'SET_SHAKE_LEVEL':
      return {
        ...state,
        mixingParams: { ...state.mixingParams, shake_level: action.level }
      }

    case 'SET_TRACK':
      return { ...state, currentTrack: action.track }

    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const initialState: JazzBarState = {
  currentStep: 'start',
  mixingParams: {
    base_spirit: null,
    ingredients: [],
    mood: null,
    mood_intensity: 3,
    ice_level: null,
    shake_level: null
  },
  currentTrack: null,
  isPlaying: false,
  isLoading: false
}

const JazzBarContext = createContext<{
  state: JazzBarState
  dispatch: React.Dispatch<JazzBarAction>
} | null>(null)

export function JazzBarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jazzBarReducer, initialState)

  return (
    <JazzBarContext.Provider value={{ state, dispatch }}>
      {children}
    </JazzBarContext.Provider>
  )
}

export function useJazzBar() {
  const context = useContext(JazzBarContext)
  if (!context) {
    throw new Error('useJazzBar must be used within JazzBarProvider')
  }
  return context
}
