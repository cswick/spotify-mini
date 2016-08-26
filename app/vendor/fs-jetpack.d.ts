interface FsJetpack {
  cwd(...args): any;
}

declare var fsJetpack: FsJetpack;

declare module "fs-jetpack" {
    export = fsJetpack;
}
