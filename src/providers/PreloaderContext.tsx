'use client';
import React, { createContext, useContext } from 'react';

type PreloaderState = { done: boolean };
const Ctx = createContext<PreloaderState>({ done: false });

export const PreloaderProvider = Ctx.Provider;
export function usePreloaderState() {
    return useContext(Ctx);
}
