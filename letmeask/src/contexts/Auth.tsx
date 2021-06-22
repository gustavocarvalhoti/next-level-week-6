import {createContext, ReactNode, useEffect, useState} from "react";
import {auth, firebase} from "../services/firebase";

type User = {
    id: string;
    name: string;
    avatar: string;
}

type AuthContextProps = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

// Create obj context
export const AuthContext = createContext({} as AuthContextProps);

export function AuthContextProver(props: AuthContextProviderProps) {

    const [user, setUser] = useState<User>();

    useEffect(() => {
        // Listening
        // Verify if user is previously logged
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const {displayName, photoURL, uid} = user;
                if (!displayName || !photoURL) {
                    throw new Error('Missing information from Google Account.');
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL
                })
            }
        })

        return () => {
            // Ever unsubscribe for Listeners
            unsubscribe();
        }
    }, []);

    async function signInWithGoogle() {
        //Auth Firebase
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);
        if (result.user) {
            // Case success
            const {displayName, photoURL, uid} = result.user;
            if (!displayName || !photoURL) {
                throw new Error('Missing information from Google Account.');
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL
            })
        }
    }

    return (
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {props.children}
        </AuthContext.Provider>
    )
}