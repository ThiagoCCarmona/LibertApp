using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public interface IFeedService
{
    Task<List<FeedPost>> GetPostsAsync();
    Task<int> LikePostAsync(int postId);
}

public class FeedService : IFeedService
{
    private readonly AppDbContext _context;

    public FeedService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeedPost>> GetPostsAsync()
    {
        return await _context.FeedPosts
            .OrderByDescending(p => p.DataPublicacao)
            .ToListAsync();
    }

    public async Task<int> LikePostAsync(int postId)
    {
        var post = await _context.FeedPosts.FindAsync(postId);
        if (post != null)
        {
            post.Likes++;
            await _context.SaveChangesAsync();
            return post.Likes;
        }
        return 0;
    }
}
