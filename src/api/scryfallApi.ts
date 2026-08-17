import { AxiosInstance } from "axios";
import axiosInstance from "./axiosInstance";
import { Card } from "@/types/Card";

class ScryfallApi {

  private axios: AxiosInstance = axiosInstance;
  private queryFilters: string[] = ['-is:alchemy', '-stamp:acorn', '-border:silver', '-is:melded', '-name:/^a-/', '-set:unk', '-t:card', '-t:vanguard', 'is:paper', '-is:playtest'];

  public async getRandomCard(filters: any = {}) {
    const queryString = Object.entries(filters)
        .map(([key, value]) => `${key}:${value}`)
        .concat(this.queryFilters)
        .concat(['is:spell'])
        .join(' ');

    return (await this.axios.get('/cards/random', {
      params: { q: queryString }
    })).data;
  }

  public async getCardByName(q: string): Promise<Card[]> {
    const queryString = [q]
        .concat(this.queryFilters)
        .join(' ');
    return (await this.axios.get('/cards/search', {
      params: { q: queryString }
    })).data.data;
  }

}

export default new ScryfallApi();
