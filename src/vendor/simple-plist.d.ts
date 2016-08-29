declare module "simple-plist" {
    export default class plist {
        static readFile(path: string, callback: (err, data) => void);
        static readFileSync(path: string) : any;
    }
}
