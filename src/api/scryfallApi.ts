import { AxiosInstance } from "axios";
import axiosInstance from "./axiosInstance";

class ScryfallApi {

  private axios: AxiosInstance = axiosInstance;

  public async getRandomCard(filters: any = {}) {
    const queryString = Object.entries(filters)
        .map(([key, value]) => `${key}=${value}`)
        .concat(['-is:alchemy', '-stamp:acorn', '-border:silver', '-is:melded', '-name:/^a-/'])
        .join(' ');

    return (await this.axios.get('/cards/random', {
      params: { q: queryString }
    })).data;
  }

}

export default new ScryfallApi();
