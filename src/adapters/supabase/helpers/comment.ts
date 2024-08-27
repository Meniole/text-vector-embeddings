import { SupabaseClient } from "@supabase/supabase-js";
import { SuperSupabase } from "./supabase";
import { Context } from "../../../types/context";

export class Comment extends SuperSupabase {
  constructor(supabase: SupabaseClient, context: Context) {
    super(supabase, context);
  }

  async createComment(commentBody: string, commentId: number) {
    //First Check if the comment already exists
    const { data, error } = await this.supabase.from("issue_comments").select("*").eq("id", commentId);
    if (error) {
      this.context.logger.error("Error creating comment", error);
      return;
    }
    if (data && data.length > 0) {
      this.context.logger.info("Comment already exists");
      return;
    } else {
      //Create the embedding for this comment
      const embedding = await this.context.adapters.openai.embedding.createEmbedding(commentBody);
      const { error } = await this.supabase.from("issue_comments").insert([{ id: commentId, body: commentBody, embedding: embedding }]);
      if (error) {
        this.context.logger.error("Error creating comment", error);
        return;
      }
    }
    this.context.logger.info("Comment created successfully");
  }

  async updateComment(commentBody: string, commentId: number) {
    //Create the embedding for this comment
    const embedding = Array.from(await this.context.adapters.openai.embedding.createEmbedding(commentBody));
    const { error } = await this.supabase.from("issue_comments").update({ body: commentBody, embedding: embedding }).eq("id", commentId);
    if (error) {
      this.context.logger.error("Error updating comment", error);
    }
  }

  async deleteComment(commentId: number) {
    const { error } = await this.supabase.from("issue_comments").delete().eq("id", commentId);
    if (error) {
      this.context.logger.error("Error deleting comment", error);
    }
  }
}
