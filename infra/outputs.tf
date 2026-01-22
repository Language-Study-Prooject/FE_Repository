# GitHub Secrets에 필요한 값들
output "s3_bucket_name" {
  description = "S3 bucket name (GitHub Secret: S3_BUCKET_NAME)"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (GitHub Secret: CLOUDFRONT_DISTRIBUTION_ID)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name (웹사이트 URL)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "aws_access_key_id" {
  description = "AWS Access Key ID (GitHub Secret: AWS_ACCESS_KEY_ID)"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "AWS Secret Access Key (GitHub Secret: AWS_SECRET_ACCESS_KEY)"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}
