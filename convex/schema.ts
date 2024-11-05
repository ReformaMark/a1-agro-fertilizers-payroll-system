
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

//test to be removed
const schema = defineSchema({
    task: defineTable({
        title: v.string(),
    })
})

export default schema;