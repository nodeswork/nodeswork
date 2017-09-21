export class Account {
  _id:              string;
  accountType:      string;
  provider:         string;
  name:             string;
  verified:         boolean;
  accountCategory:  AccountCategory;
}

export interface AccountCategory {
  accountType: string;
  provider:    string;
  name:        string;
  imageUrl:    string;
}

