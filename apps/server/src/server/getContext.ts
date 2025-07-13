import { ParameterizedContext } from "koa";
import { getDataloaders } from "../modules/loader/loaderRegister";
import { decodeToken } from "../modules/auth/jwt";

const getContext = (ctx: ParameterizedContext) => {
    const dataloaders = getDataloaders();
    const token = ctx.headers.authorization?.replace("Bearer ", "");
    const user = decodeToken(token);

    return {
        dataloaders,
        user,
    } as const;
};

export { getContext };
