export interface IAuthStoreState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export interface IAppState {
  authState: IAuthStoreState;
}
