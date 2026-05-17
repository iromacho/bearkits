type FirebaseApp = unknown;
type FirebaseAuth = unknown;
type FirebaseProvider = unknown;

type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type FirebaseAppModule = {
  initializeApp: (config: typeof firebaseConfig) => FirebaseApp;
  getApps: () => FirebaseApp[];
  getApp: () => FirebaseApp;
};

type FirebaseAuthModule = {
  getAuth: (app: FirebaseApp) => FirebaseAuth;
  GoogleAuthProvider: new () => FirebaseProvider;
  onAuthStateChanged: (
    auth: FirebaseAuth,
    callback: (user: FirebaseUser | null) => void,
  ) => () => void;
  signInWithPopup: (
    auth: FirebaseAuth,
    provider: FirebaseProvider,
  ) => Promise<{ user: FirebaseUser }>;
  signInWithEmailAndPassword: (
    auth: FirebaseAuth,
    email: string,
    password: string,
  ) => Promise<{ user: FirebaseUser }>;
  createUserWithEmailAndPassword: (
    auth: FirebaseAuth,
    email: string,
    password: string,
  ) => Promise<{ user: FirebaseUser }>;
  updateProfile: (user: FirebaseUser, profile: { displayName?: string }) => Promise<void>;
  signOut: (auth: FirebaseAuth) => Promise<void>;
};

type FirebaseAnalyticsModule = {
  getAnalytics: (app: FirebaseApp) => unknown;
  isSupported: () => Promise<boolean>;
};

export type BearkitsFirebaseUser = {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

const firebaseConfig = {
  apiKey: "AIzaSyBC-n0_RpNwqZolA9V_ZdfxFqDyrNKA0Es",
  authDomain: "bearkits-959fd.firebaseapp.com",
  projectId: "bearkits-959fd",
  storageBucket: "bearkits-959fd.firebasestorage.app",
  messagingSenderId: "354621792425",
  appId: "1:354621792425:web:6936d47decab70948a09b8",
  measurementId: "G-5JH6592NL1",
} as const;

const firebaseVersion = "10.14.1";

let appPromise: Promise<FirebaseApp> | null = null;
let authPromise: Promise<{ auth: FirebaseAuth; authModule: FirebaseAuthModule }> | null = null;

const toBearkitsUser = (user: FirebaseUser): BearkitsFirebaseUser => ({
  id: user.uid,
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

async function importFirebaseApp() {
  return import(
    /* @vite-ignore */ `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`
  ) as Promise<FirebaseAppModule>;
}

async function importFirebaseAuth() {
  return import(
    /* @vite-ignore */ `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-auth.js`
  ) as Promise<FirebaseAuthModule>;
}

async function importFirebaseAnalytics() {
  return import(
    /* @vite-ignore */ `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-analytics.js`
  ) as Promise<FirebaseAnalyticsModule>;
}

export async function getFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase solo está disponible en el navegador.");
  }

  if (!appPromise) {
    appPromise = importFirebaseApp().then(({ initializeApp, getApps, getApp }) => {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

      importFirebaseAnalytics().then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) getAnalytics(app);
        });
      });

      return app;
    });
  }

  return appPromise;
}

async function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), importFirebaseAuth()]).then(
      ([app, authModule]) => ({
        auth: authModule.getAuth(app),
        authModule,
      }),
    );
  }

  return authPromise;
}

export async function signInWithGoogle() {
  const { auth, authModule } = await getFirebaseAuth();
  const provider = new authModule.GoogleAuthProvider();
  const { user } = await authModule.signInWithPopup(auth, provider);
  return toBearkitsUser(user);
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { auth, authModule } = await getFirebaseAuth();
  const { user } = await authModule.signInWithEmailAndPassword(auth, email, password);
  return toBearkitsUser(user);
}

export async function createAccountWithEmailPassword(
  name: string,
  email: string,
  password: string,
) {
  const { auth, authModule } = await getFirebaseAuth();
  const { user } = await authModule.createUserWithEmailAndPassword(auth, email, password);

  if (name.trim()) {
    await authModule.updateProfile(user, { displayName: name.trim() });
    return toBearkitsUser({ ...user, displayName: name.trim() });
  }

  return toBearkitsUser(user);
}

export async function signOutOfFirebase() {
  const { auth, authModule } = await getFirebaseAuth();
  await authModule.signOut(auth);
}

export async function watchFirebaseAuth(callback: (user: BearkitsFirebaseUser | null) => void) {
  const { auth, authModule } = await getFirebaseAuth();
  return authModule.onAuthStateChanged(auth, (user) => {
    callback(user ? toBearkitsUser(user) : null);
  });
}
