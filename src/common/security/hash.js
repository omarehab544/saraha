import bcrypt from "bcrypt";



export async function Hash(password,SALT_ROUNDS = 12) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function CompareHash(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}