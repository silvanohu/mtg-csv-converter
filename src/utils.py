def cents_to_euros(cents):
    """
    Converts a price in cents to euros, using a dot for decimals.

    :param cents: an int representing the price in cents.
    :return: the price in euros.
    """

    euros = cents / 100  # Convert cents to euros
    return f"{euros:.2f}"  # Format with two decimal places