import utils as utl
import pandas as pd

def parse_sheet(file):
    """
    This function parses a CardTrader's order .xls file into a Moxfield .csv file.

    :param file: the path of the .xls file.
    :return: a string containing the .csv data.
    """

    # The .csv file's header
    output = "Count,Name,Edition,Condition,Language,Foil,Collector Number,Alter,Playtest Card,Purchase Price"

    df = pd.read_excel(file)

    if df.empty:
        return output
    else:
        for index, row in df.iterrows():
            # The count of the card
            output += "\n" + str(row.iloc[6]) + ","

            # The name of the card
            output += row.iloc[4] + ","

            # The edition of the card
            output += row.iloc[3] + ","

            # The condition of the card
            output += row.iloc[7] + ","

            # The language of the card
            output += row.iloc[8] + ","

            # If the card is foil or not
            if row.iloc[9] == "VERO":
                output += "foil"
            else:
                output += ""
            output += ","

            # The collector number of the card
            if row.iloc[14] is not None:
                output += str(row.iloc[14])
            output += ","

            # If the card is an alter or not
            if row.iloc[11] == "VERO":
                output += "TRUE"
            else:
                output += ""
            output += ","

            # If the card is a playtest or not
            output += ","

            # The purchase price of the card
            price = utl.cents_to_euros(row.iloc[5])
            output += price + ","

    return output