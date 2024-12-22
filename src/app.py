import parser as prs

file_path = input("Enter the path of the .xls file: ")

data = prs.parse_sheet(file_path)

with open('../output.csv', 'w') as file:
    file.write(data)

print("The .xls file has been successfully converted to .csv!")