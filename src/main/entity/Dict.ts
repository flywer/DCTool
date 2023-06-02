import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Dict {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    value: string
}
